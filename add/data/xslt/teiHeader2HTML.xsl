<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:tei="http://www.tei-c.org/ns/1.0" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:eof="http://www.edirom.de/xslt/ediromOnlineFunctions" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" exclude-result-prefixes="xs eof xd tei" version="2.0" xml:space="default">

<!-- IMPORTs TEI ======================================================= -->
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
  
<!-- IMPORTs ======================================================= -->
    <xsl:import href="ediromOnline_params.xsl"/>
    <xsl:import href="ediromOnline_functions.xsl"/>
    <xsl:import href="ediromOnline_metadata.xsl"/>
  
    
<!-- OUTPUT ======================================================= -->
    <xsl:output encoding="UTF-8" media-type="text/xhmtl" method="xhtml" omit-xml-declaration="yes" indent="yes"/>

<!-- DEFAULT TEMPLATEs ======================================================= -->
    
    <xd:doc scope="component">
        <xd:desc>Override for root template in order to start processing at teiHeader</xd:desc>
    </xd:doc>
    <xsl:template match="/">
        <xsl:apply-templates select="//tei:teiHeader"/>
    </xsl:template>
    
    <xsl:template match="node()" mode="plainCommaSep">
        <xsl:choose>
            <!-- nur attribute keinerlei kindknoten -->
            <xsl:when test="@* and not(node())"><!-- evtl attributnamen? -->
                <xsl:text>(</xsl:text>
                <xsl:apply-templates select="@*" mode="plainCommaSep"/>
                <xsl:text>)</xsl:text>
            </xsl:when>
            <!-- nur attribute und textknoten -->
            <xsl:when test="@* and not(*)">
                <xsl:apply-templates mode="plainCommaSep"/>
                <xsl:text> (</xsl:text>
                <xsl:apply-templates select="@*" mode="plainCommaSep"/>
                <xsl:text>)</xsl:text>
            </xsl:when>
            <!-- kindeskinder und attribute -->
            <xsl:when test="*/* and @*">
                <xsl:apply-templates select="@*" mode="plainCommaSep"/>
                <xsl:apply-templates select="*" mode="plainCommaSep"/>
            </xsl:when>
            <!-- kindeskinder keine attribute -->
            <xsl:when test="*/* and not(@*)">
                <xsl:apply-templates select="@*" mode="plainCommaSep"/>
                <xsl:apply-templates select="*" mode="plainCommaSep"/>
            </xsl:when>
            <!-- elemente und attribute -->
            <xsl:when test="* and @*">
                <xsl:apply-templates select="*" mode="plainCommaSep"/>
                <xsl:apply-templates select="@*" mode="plainCommaSep"/>
            </xsl:when>
            <xsl:when test="*">
                <xsl:value-of select="*" separator=", "/>
            </xsl:when>
            <!-- if node is none of the above but has atribute -->
            <xsl:when test="@*">
                <xsl:text> (</xsl:text>
                <xsl:apply-templates select="@*" mode="plainCommaSep"/>
                <xsl:text>) </xsl:text>
            </xsl:when>
            <xsl:otherwise>
                <xsl:value-of select="."/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template match="*" mode="plainDivs">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="@*" mode="subProp"/>

    <xsl:template match="node()" mode="subProp">
        <xsl:if test="@*">
            <xsl:text> (</xsl:text>
            <xsl:value-of select="@*" separator=", "/>
            <xsl:text>) </xsl:text>
        </xsl:if>
        <xsl:apply-templates mode="plainCommaSep"/>
    </xsl:template>
<!-- NAMED TEMPLATEs ======================================================= -->
    <xd:doc scope="component">
        <xd:desc>Override TEI microData template</xd:desc>
    </xd:doc>
    <xsl:template name="bodyMicroData"/>

<!-- TEMPLATEs ======================================================= -->
    
    <xsl:template match="@when" mode="plainCommaSep">
        <xsl:value-of select="."/>
    </xsl:template>
    
    <xsl:template match="tei:author">
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>Add a div with class teiHeader then process children</xd:desc>
    </xd:doc>
    <xsl:template match="tei:teiHeader">
        <xsl:element name="div">
            <xsl:attribute name="class" select="string('teiHeader')"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    
    
    <xsl:template match="tei:change">
        <xsl:element name="div">
            <xsl:attribute name="class">property</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class">key</xsl:attribute>
                <xsl:value-of select="eof:getLabel(local-name())"/>
                <xsl:if test="@n">
                    <xsl:value-of select="concat(' ', @n)"/>
                </xsl:if>
                <xsl:if test="@when">
                    <xsl:element name="span">
                        <xsl:attribute name="class">date</xsl:attribute>
                        <xsl:value-of select="./@when"/>
                    </xsl:element>
                </xsl:if>
            </xsl:element>
            <xsl:element name="div">
                <xsl:attribute name="class">value</xsl:attribute>
                <xsl:value-of select="concat(@who, ': ')"/>
                <xsl:apply-templates/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="tei:handNote" mode="plainCommaSep">
        <xsl:element name="p">
            <xsl:apply-templates mode="#current"/>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="tei:imprint">
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>
    
    
    <xsl:template match="tei:imprint" mode="plainCommaSep">
        <xsl:value-of select="tei:publisher"/>
        <xsl:text> (</xsl:text>
        <xsl:value-of select="eof:getLabel('publisher')"/>
        <xsl:text>), </xsl:text>
        <xsl:value-of select="tei:pubPlace, tei:date" separator=", "/>
    </xsl:template>
    
    
    <xsl:template match="tei:physDesc">
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>
    
    
    <xsl:template match="tei:respStmt">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">respStmt property</xsl:with-param>
            </xsl:call-template>
            <xsl:apply-templates select="tei:resp" mode="bibl"/>
            <xsl:element name="div">
                <xsl:call-template name="rendToClass">
                    <xsl:with-param name="default">value</xsl:with-param>
                </xsl:call-template>
                <xsl:apply-templates select="tei:name" mode="bibl"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    
    
    <xsl:template match="tei:resp" mode="bibl">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">resp key</xsl:with-param>
            </xsl:call-template>
            <xsl:value-of select="if(eof:getLabel(tei:resp/text()) != '') then(eof:getLabel(tei:resp/text())) else(text())"/>
<!--            <xsl:value-of select="$pListKeyDelim"/>-->
        </xsl:element>
    </xsl:template>
    <xd:doc scope="component">
        <xd:desc>Process element witness</xd:desc>
    </xd:doc>
    <xsl:template match="tei:witness">
        <xsl:element name="div">
            <xsl:call-template name="rendToProperty">
                <xsl:with-param name="key" select="@xml:id"/>
            </xsl:call-template>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('value')"/>
                <xsl:for-each select="tei:biblStruct | tei:msDesc | tei:note">
                    <xsl:if test="preceding-sibling::*">
                        <br/>
                    </xsl:if>
                    <xsl:apply-templates mode="plainCommaSep"/>
                </xsl:for-each>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    
    
    <xsl:template match="tei:name" mode="bibl">
        <xsl:element name="span">
            <xsl:call-template name="rendToClass"/>
            <xsl:apply-templates/>
        </xsl:element>
        <xsl:text>; </xsl:text>
    </xsl:template>
    
    
    <xsl:template match="tei:note" mode="plainCommaSep">
        See: <xsl:apply-templates/>
    </xsl:template>
    
    
    <xsl:template match="tei:msIdentifier">
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>
    
    
    <xsl:template match="tei:msIdentifier" mode="plainCommaSep">
        <!--<xsl:value-of select="tei:repository, tei:settlement, tei:country" separator=", "/>
        <xsl:text>: </xsl:text>
        <xsl:value-of select="tei:idno"/>-->
        <xsl:for-each select="*">
            <xsl:call-template name="makeSubProperty">
                <xsl:with-param name="node" select="."/>
            </xsl:call-template>
        </xsl:for-each>
<!--        <xsl:apply-templates mode="plainCommaSep"/>-->
    </xsl:template>
    
    <xsl:template match="tei:msName">
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>

    <xsl:template match="tei:publicationStmt">
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>define subProperties for pubStmt</xd:desc>
    </xd:doc>
    <xsl:template match="tei:publisher | tei:date[parent::tei:publicationStmt] | tei:idno" mode="plainCommaSep">
        <xsl:call-template name="makeSubProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>

    <xsl:template match="tei:availability" mode="plainCommaSep">
        <xsl:call-template name="makeSubProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>

    <xsl:template match="@target" mode="plainCommaSep">
        <xsl:element name="a">
            <xsl:attribute name="href" select="."/>
            <xsl:attribute name="target">_blank</xsl:attribute>
            <xsl:value-of select="."/>
        </xsl:element>
    </xsl:template>

    <xsl:template match="@target" mode="plainCommaSep">
        <xsl:element name="a">
            <xsl:attribute name="href" select="."/>
            <xsl:attribute name="target">_blank</xsl:attribute>
            <xsl:value-of select="."/>
        </xsl:element>
    </xsl:template>
        
    <xsl:template match="tei:title">
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
            <xsl:with-param name="key" select="if(@level)then(concat(local-name(), '_', @level))else(local-name())"/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="tei:revisionDesc">
        <xsl:call-template name="makeSection"/>
    </xsl:template>
    <xsl:template match="tei:funder">
        <xsl:element name="div">
            <xsl:call-template name="rendToProperty"/>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('value')"/>
                <xsl:apply-templates mode="plainDivs"/>
            </xsl:element>
        </xsl:element>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>list of elements in tei:sourceDesc to be rendered as properties</xd:desc>
    </xd:doc>
    <xsl:template match="tei:foliation | tei:collation | tei:supportDesc | tei:handDesc | tei:decoDesc | tei:additions" mode="plainCommaSep">
        <xsl:call-template name="makeSubProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>
    
    <xsl:template match="tei:extent" mode="plainCommaSep">
        <xsl:param name="key" select="local-name(.)"/>
        <xsl:element name="div">
            <xsl:attribute name="class">subProperty</xsl:attribute>
            <xsl:element name="div">
                <xsl:attribute name="class" select="string('subkey')"/>
                <xsl:value-of select="eof:getLabel($key)"/>
                
                <xsl:for-each select="tei:measure, tei:dimensions">
                    <xsl:element name="span">
                        <xsl:attribute name="class">unit</xsl:attribute>
                        <xsl:value-of select="@type, @unit" separator="/"/>
                    </xsl:element>
                </xsl:for-each>
                
            </xsl:element>
            <xsl:element name="span">
                <xsl:attribute name="class" select="string('subvalue')"/>
                
                <xsl:for-each select="tei:measure, tei:dimensions">
                    <xsl:element name="div">
                        <xsl:apply-templates/>
                    </xsl:element>
                </xsl:for-each>
                
            </xsl:element>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="tei:address" mode="plainDivs">
        <xsl:apply-templates select="tei:street" mode="#current"/>
        <xsl:call-template name="postCodeSettlement"/>
    </xsl:template>
    
    <xsl:template match="tei:address" mode="plainCommaSep">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">address plain</xsl:with-param>
            </xsl:call-template>
            <xsl:value-of select="*" separator=", "/>
        </xsl:element>
    </xsl:template>
    
    

    <xsl:template match="tei:history | tei:additional">
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>lsit of elements in tei:profileDesc to be rendered as properties</xd:desc>
    </xd:doc>
    <xsl:template match="tei:creation">
        <xsl:call-template name="makeProperty">
            <xsl:with-param name="node" select="."/>
        </xsl:call-template>
    </xsl:template>
    <xsl:template match="tei:creation" mode="plainCommaSep">
        <xsl:apply-templates mode="plainCommaSep"/>
    </xsl:template>
    
    <xsl:template match="tei:dimensions" mode="plainCommaSep">
        <xsl:value-of select="@type, @unit" separator=", "/>
        <xsl:text>: </xsl:text>
        <xsl:if test="*">
            <xsl:variable name="childNames" as="item()*">
                <xsl:for-each select="*">
                    <xsl:value-of select="eof:getLabel(local-name(.))"/>
                </xsl:for-each>
            </xsl:variable>
            <xsl:value-of select="*" separator=" x "/>
            <xsl:text> (</xsl:text>
            <xsl:value-of select="string-join($childNames, ' x ')"/>
            <xsl:text>) </xsl:text>
        </xsl:if>
    </xsl:template>



    <xsl:template match="tei:placeName">
        <xsl:value-of select="*" separator=", "/>
    </xsl:template>
    <xsl:template match="tei:street" mode="plainDivs">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass"/>
            <xsl:apply-templates/>
        </xsl:element>
    </xsl:template>
    <xsl:template name="postCodeSettlement">
        <xsl:element name="div">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="id">postCodeSettlement</xsl:with-param>
            </xsl:call-template>
            <xsl:apply-templates select="tei:postCode" mode="plain"/>
            <xsl:text> </xsl:text>
            <xsl:apply-templates select="tei:placeName"/>
        </xsl:element>
    </xsl:template>
    
    <xsl:template match="tei:p">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    <xsl:template match="tei:p" mode="plainCommaSep">
        <p>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    
    <xsl:template match="tei:listBibl" mode="plainCommaSep">
        <xsl:element name="span">
            <xsl:call-template name="rendToClass">
                <xsl:with-param name="default">subkey</xsl:with-param>
            </xsl:call-template>
            <xsl:value-of select="eof:getLabel(local-name(.))"/>
        </xsl:element>
        <xsl:apply-templates select="." mode="#default"/>
    </xsl:template>
    
    <xd:doc scope="component">
        <xd:desc>Specifies the TEI elements to be rendered as sections</xd:desc>
    </xd:doc>
    <xsl:template match="tei:fileDesc | tei:sourceDesc | tei:profileDesc">
        <xsl:call-template name="makeSection"/>
    </xsl:template>
    
</xsl:stylesheet>