<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:exist="http://exist.sourceforge.net/NS/exist" exclude-result-prefixes="#default xs tei exist xhtml" version="2.0">
    <xsl:import href="tei/common2/tei-param.xsl"/>
    <xsl:import href="tei/common2/tei.xsl"/>
    <xsl:import href="tei/xhtml2/tei-param.xsl"/>
    <xsl:import href="tei/common2/core.xsl"/>
    <xsl:import href="tei/common2/textstructure.xsl"/>
    <xsl:import href="tei/common2/header.xsl"/>
    <xsl:import href="tei/common2/linking.xsl"/>
    <xsl:import href="tei/common2/figures.xsl"/>
    <xsl:import href="tei/common2/textcrit.xsl"/>
    <xsl:import href="tei/common2/i18n.xsl"/>
    <xsl:import href="tei/common2/functions.xsl"/>
    <xsl:import href="tei/xhtml2/core.xsl"/>
    <xsl:import href="tei/xhtml2/corpus.xsl"/>
    <xsl:import href="tei/xhtml2/dictionaries.xsl"/>
    <xsl:import href="tei/xhtml2/drama.xsl"/>
    <xsl:import href="tei/xhtml2/figures.xsl"/>
    <xsl:import href="tei/xhtml2/header.xsl"/>
    <xsl:import href="tei/xhtml2/linking.xsl"/>
    <xsl:import href="tei/xhtml2/namesdates.xsl"/>
    <xsl:import href="tei/xhtml2/tagdocs.xsl"/>
    <xsl:import href="tei/xhtml2/textstructure.xsl"/>
    <xsl:import href="tei/xhtml2/textcrit.xsl"/>
    <xsl:import href="tei/xhtml2/transcr.xsl"/>
    <xsl:import href="tei/xhtml2/verse.xsl"/>
    <xsl:import href="tei/common2/verbatim.xsl"/>
    <xsl:output encoding="UTF-8" media-type="text/xhmtl" method="xhtml" omit-xml-declaration="yes" indent="yes"/>
    <xsl:param name="lang">en</xsl:param>
    <xsl:param name="base" as="xs:string"/>

    <!-- OVERWRITE FOLLOWING TEI-PARAMS -->
    <xsl:param name="numberHeadings">false</xsl:param>
    <xsl:param name="autoHead">false</xsl:param>
    <xsl:param name="graphicsPrefix">../../../digilib/Scaler/</xsl:param><!-- ?dw=500&mo=fi -->
    <!-- END OVERWRITE TEI-PARAMS -->
    <xsl:variable name="masterFile" select="string('file')"/>
    <xsl:variable name="i18n" select="document(concat($base, 'tei/i18n.xml'))"/>
    <xsl:variable name="language">
        <xsl:choose>
            <xsl:when test="doc-available(concat($base, 'i18n/{$lang}.xml'))">
                <xsl:copy-of select="document(concat($base, 'i18n/{$lang}.xml'))"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy-of select="document(concat($base, 'i18n/en.xml'))"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:variable name="fallback">
        <xsl:choose>
            <xsl:when test="$lang eq 'en'"/>
            <xsl:otherwise>
                <xsl:copy-of select="document(concat($base, 'i18n/en.xml'))"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:variable>
    <xsl:function name="tei:getLabel" xpath-default-namespace="">
        <xsl:param name="key"/>
        <xsl:choose>
            <!--<xsl:when test="$lang eq 'en'">
                <xsl:value-of select="$language/id($key)/text()"/>
            </xsl:when>-->
            <xsl:when test="$language/id($key) and not($language/id($key)/text() eq '')">
                <xsl:value-of select="$language/id($key)/text()"/>
            </xsl:when>
            <xsl:otherwise>
                <!--<xsl:value-of select="$fallback/id($key)/text()"/><!-\- BWB welchen Sinn macht das? -\->-->
                <xsl:value-of select="$key"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    <xsl:function name="tei:calcDimension">
        <xsl:param name="value"/>
        <xsl:choose>
            <xsl:when test="contains($value,'in')">
                <xsl:value-of select="round($dpi * number(substring-before($value,'in')))"/>
            </xsl:when>
            <xsl:when test="contains($value,'pt')">
                <xsl:value-of select="round($dpi * (number(substring-before($value,'pt')) div 72))"/>
            </xsl:when>
            <xsl:when test="contains($value,'cm')">
                <xsl:value-of select="round($dpi * (number(substring-before($value,'cm')) div 2.54 ))"/>
            </xsl:when>
            <xsl:when test="contains($value,'px')">
                <xsl:value-of select="substring-before($value,'px')"/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="$value"/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:function>
    <xsl:template name="makeSection">
        <xsl:param name="element"/>
        <xsl:element name="div">
            <xsl:attribute name="class" select="string('section')"/>
            <xsl:element name="h1">
                <xsl:value-of select="if(tei:getLabel(local-name($element)) != '')then(tei:getLabel(local-name($element)))else(local-name($element))"/>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('propertyList')"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    <xsl:template name="bodyMicroData"/>
    <xsl:template match="/">
        <xsl:apply-templates select="//tei:text"/>
    </xsl:template>
    <xsl:template name="divContents">
        <xsl:param name="Depth"/>
        <xsl:param name="nav">false</xsl:param>
        <xsl:variable name="ident">
            <xsl:apply-templates mode="ident" select="."/>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="parent::tei:*/@rend='multicol'">
                <td valign="top">
                    <xsl:if test="not($Depth = '')">
                        <xsl:element name="h{$Depth + $divOffset}">
                            <xsl:for-each select="tei:head[1]">
                                <xsl:call-template name="rendToClass">
                                    <xsl:with-param name="default"/>
                                </xsl:call-template>
                            </xsl:for-each>
                            <xsl:call-template name="header">
                                <xsl:with-param name="display">full</xsl:with-param>
                            </xsl:call-template>
                            <xsl:call-template name="sectionHeadHook"/>
                        </xsl:element>
                    </xsl:if>
                    <xsl:apply-templates/>
                </td>
            </xsl:when>
            <xsl:when test="@rend='multicol'">
                <xsl:apply-templates select="*[not(local-name(.)='div')]"/>
                <table>
                    <tr>
                        <xsl:apply-templates select="tei:div"/>
                    </tr>
                </table>
            </xsl:when>
            <xsl:when test="@rend='nohead' or not(tei:head)">
                <xsl:apply-templates/>
            </xsl:when>
            <xsl:otherwise>
                <xsl:if test="not($Depth = '')">
                    <xsl:element name="{if (number($Depth)+$divOffset &gt;6) then 'div'                     else concat('h',number($Depth) + $divOffset)}">
                        <xsl:choose>
                            <xsl:when test="@rend">
                                <xsl:call-template name="rendToClass">
                                    <xsl:with-param name="id">false</xsl:with-param>
                                </xsl:call-template>
                            </xsl:when>
                            <xsl:otherwise>
                                <xsl:for-each select="tei:head">
                                    <xsl:call-template name="rendToClass">
                                        <xsl:with-param name="default">
                                            <xsl:if test="number($Depth)&gt;5">
                                                <xsl:text>div</xsl:text>
                                                <xsl:value-of select="$Depth"/>
                                            </xsl:if>
                                        </xsl:with-param>
                                    </xsl:call-template>
                                </xsl:for-each>
                            </xsl:otherwise>
                        </xsl:choose>
                        <xsl:call-template name="header">
                            <xsl:with-param name="display">full</xsl:with-param>
                        </xsl:call-template>
                        <xsl:call-template name="sectionHeadHook"/>
                    </xsl:element>
                    <xsl:if test="$topNavigationPanel='true' and $nav='true'">
                        <xsl:call-template name="xrefpanel">
                            <xsl:with-param name="homepage" select="concat($masterFile,$standardSuffix)"/>
                            <xsl:with-param name="mode" select="local-name(.)"/>
                        </xsl:call-template>
                    </xsl:if>
                </xsl:if>
                <xsl:apply-templates/>
                <xsl:if test="$bottomNavigationPanel='true' and $nav='true'">
                    <xsl:call-template name="xrefpanel">
                        <xsl:with-param name="homepage" select="concat($masterFile,$standardSuffix)"/>
                        <xsl:with-param name="mode" select="local-name(.)"/>
                    </xsl:call-template>
                </xsl:if>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template name="showGraphic">
        <xsl:variable name="File">
            <xsl:choose>
                <xsl:when test="starts-with(@url, 'http://')">
                    <xsl:value-of select="@url"/>
                </xsl:when>
                <xsl:when test="@url != ''">
                    <xsl:value-of select="concat($graphicsPrefix, @url)"/>
                    <xsl:if test="not(contains(@url,'.'))">
                        <xsl:value-of select="$graphicsSuffix"/>
                    </xsl:if>
                    <xsl:text>?</xsl:text>
                    <xsl:for-each-group group-by="parent::node()" select="@width | @height | @scale"><!-- | @scale -->
                        <xsl:for-each select="current-group()">
                            <xsl:choose>
                                <xsl:when test="name() = 'height'">
                                    <xsl:value-of select="concat('dh=', tei:calcDimension(.), '&amp;', 'amp;')"/>
                                </xsl:when>
                                <xsl:when test="name() = 'width'">
                                    <xsl:value-of select="concat('dw=', tei:calcDimension(.), '&amp;', 'amp;')"/>
                                </xsl:when>
<!--                            <xsl:when test="name() = 'scale'">
                                    <xsl:value-of select="concat('dh=', tei:calcDimension(.), '&', 'amp;')"/>
                                </xsl:when>-->
                                <xsl:otherwise/>
                            </xsl:choose>
                        </xsl:for-each>
                    </xsl:for-each-group>
                    <xsl:if test="not(@width | @height | @scale)">
                        <xsl:value-of select="concat('dw=350', '&amp;', 'amp;')"/>
                    </xsl:if>
                    <xsl:text>mo=fit</xsl:text>
                </xsl:when>
                <xsl:when test="@url = ''">error<xsl:value-of select="$graphicsSuffix"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:message terminate="yes">Cannot work out how to do a graphic
                    </xsl:message>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="Alt">
            <xsl:choose>
                <xsl:when test="tei:desc">
                    <xsl:for-each select="tei:desc">
                        <xsl:apply-templates mode="plain"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="tei:figDesc">
                    <xsl:for-each select="tei:figDesc">
                        <xsl:apply-templates mode="plain"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="tei:head">
                    <xsl:value-of select="tei:head/text()"/>
                </xsl:when>
                <xsl:when test="parent::tei:figure/tei:figDesc">
                    <xsl:for-each select="parent::tei:figure/tei:figDesc">
                        <xsl:apply-templates mode="plain"/>
                    </xsl:for-each>
                </xsl:when>
                <xsl:when test="parent::tei:figure/tei:head">
                    <xsl:value-of select="parent::tei:figure/tei:head/text()"/>
                </xsl:when>
            </xsl:choose>
        </xsl:variable>
        <xsl:choose>
            <xsl:when test="$showFigures='true'">
                <xsl:choose>
                    <xsl:when test="@type='thumbnail'"/>
                    <xsl:when test="starts-with(@mimeType, 'video')">
                        <video src="{$File}" controls="controls">
                            <xsl:if test="../tei:graphic[@type='thumbnail']">
                                <xsl:attribute name="poster">
                                    <xsl:value-of select="../tei:graphic[@type='thumbnail']/@url"/>
                                </xsl:attribute>
                            </xsl:if>
                        </video>
                    </xsl:when>
                    <xsl:otherwise>
                        <img src="{$File}">
                            <xsl:attribute name="alt">
                                <xsl:value-of select="$Alt"/>
                            </xsl:attribute>
                            <xsl:call-template name="imgHook"/>
                            <xsl:if test="@xml:id">
                                <xsl:attribute name="id">
                                    <xsl:value-of select="@xml:id"/>
                                </xsl:attribute>
                            </xsl:if>
                            <xsl:call-template name="rendToClass"/>
                            <xsl:if test="@width">
                                <xsl:call-template name="setDimension">
                                    <xsl:with-param name="value">
                                        <xsl:value-of select="@width"/>
                                    </xsl:with-param>
                                    <xsl:with-param name="name">width</xsl:with-param>
                                </xsl:call-template>
                            </xsl:if>
                            <xsl:if test="@height">
                                <xsl:call-template name="setDimension">
                                    <xsl:with-param name="value">
                                        <xsl:value-of select="@height"/>
                                    </xsl:with-param>
                                    <xsl:with-param name="name">height</xsl:with-param>
                                </xsl:call-template>
                            </xsl:if>
                        </img>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:when>
            <xsl:otherwise>
                <div class="altfigure">
                    <xsl:call-template name="i18n">
                        <xsl:with-param name="word">figureWord</xsl:with-param>
                    </xsl:call-template>
                    <xsl:text> </xsl:text>
                    <xsl:for-each select="self::tei:figure|parent::tei:figure">
                        <xsl:number count="tei:figure[tei:head]" level="any"/>
                    </xsl:for-each>
                    <xsl:text> </xsl:text>
                    <xsl:value-of select="$File"/>
                    <xsl:text> [</xsl:text>
                    <xsl:value-of select="$Alt"/>
                    <xsl:text>] </xsl:text>
                </div>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:ref">
        <xsl:param name="class">link_<xsl:value-of select="local-name(.)"/>
        </xsl:param>
        <xsl:choose>
            <xsl:when test="starts-with(@target, 'xmldb:exist://')">
                <a>
                    <xsl:choose>
                        <xsl:when test="matches(@target, '\[.*\]')">
                            <xsl:attribute name="onclick">
                                <xsl:text>loadLink('</xsl:text>
                                <xsl:value-of select="replace(@target, '\[.*\]', '')"/>
                                <xsl:text>', {</xsl:text>
                                <xsl:value-of select="replace(substring-before(substring-after(@target, '['), ']'), '=', ':')"/>
                                <xsl:text>})</xsl:text>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="onclick">
                                <xsl:text>loadLink("</xsl:text>
                                <xsl:value-of select="@target"/>
                                <xsl:text>")</xsl:text>
                            </xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:if test="@xml:id">
                        <xsl:copy-of select="@xml:id"/>
                    </xsl:if>
                    <xsl:choose>
                        <xsl:when test="@rend">
                            <xsl:attribute name="class">
                                <xsl:value-of select="@rend"/>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:when test="@rendition">
                            <xsl:call-template name="applyRendition"/>
                        </xsl:when>
                        <xsl:when test="parent::tei:item/parent::tei:list[@rend]">
                            <xsl:attribute name="class">
                                <xsl:value-of select="parent::tei:item/parent::tei:list/@rend"/>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:when test="parent::tei:item[@rend]">
                            <xsl:attribute name="class">
                                <xsl:value-of select="parent::tei:item/@rend"/>
                            </xsl:attribute>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:attribute name="class">
                                <xsl:value-of select="$class"/>
                            </xsl:attribute>
                        </xsl:otherwise>
                    </xsl:choose>
                    <xsl:if test="@type">
                        <xsl:attribute name="type">
                            <xsl:value-of select="@type"/>
                        </xsl:attribute>
                    </xsl:if>
                    <xsl:choose>
                        <xsl:when test="@n">
                            <xsl:attribute name="title">
                                <xsl:value-of select="@n"/>
                            </xsl:attribute>
                        </xsl:when>
                    </xsl:choose>
                    <xsl:call-template name="xrefHook"/>
                    <xsl:apply-templates/>
                </a>
            </xsl:when>
            <xsl:otherwise>
                <xsl:variable name="id" select="@xml:id"/>
                <xsl:variable name="targetExternal" select="@type"/>
                <xsl:variable name="link">
                    <xsl:call-template name="makeTEILink">
                        <xsl:with-param name="ptr" select="false()"/>
                    </xsl:call-template>
                </xsl:variable>
                <xsl:for-each select="$link/*">
                    <xsl:copy>
                        <xsl:if test="$id">
                            <xsl:attribute name="id" select="$id"/>
                        </xsl:if>
                        <xsl:if test="$targetExternal eq 'external'">
                            <xsl:attribute name="target" select="'_blank'"/>
                        </xsl:if>
                        <xsl:for-each select="*|text()|@*">
                            <xsl:copy-of select="."/>
                        </xsl:for-each>
                    </xsl:copy>
                </xsl:for-each>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    <xsl:template match="tei:abbr">
        <xsl:element name="span">
            <xsl:attribute name="class">abbr</xsl:attribute>
            <xsl:attribute name="title">
                <xsl:value-of select="."/>
            </xsl:attribute>
            <xsl:apply-templates select="text()"/>
        </xsl:element>
    </xsl:template>
<xsl:template match="exist:match">
        <span class="searchResult">
            <xsl:apply-templates/>
        </span>
    </xsl:template>
</xsl:stylesheet>