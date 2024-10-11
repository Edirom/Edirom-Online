<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:mei="http://www.music-encoding.org/ns/mei" xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl" xmlns:functx="http://www.functx.com" xmlns="http://www.w3.org/1999/xhtml" exclude-result-prefixes="xs xd" version="2.0">

    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Mar 19, 2012</xd:p>
            <xd:p><xd:b>Author:</xd:b> Johannes Kepper</xd:p>
            <xd:p></xd:p>
        </xd:desc>
    </xd:doc>

    <xsl:output method="xhtml" media-type="text/html" indent="yes" omit-xml-declaration="yes" />

    <xsl:param name="idPrefix" select="string('')" />

    <xsl:param name="imagePrefix" select="string('')" />


    <xsl:variable name="footnotes">
        <xsl:copy-of select=".//mei:annot[@type = 'note' and @place = 'foot']" />
    </xsl:variable>


    <xsl:variable name="footnotesBlock">
        <xsl:for-each select="$footnotes/mei:annot">
            <xsl:variable name="counter">
                <xsl:value-of select="position()" />
            </xsl:variable>
            <xsl:variable name="content">
                <xsl:apply-templates />
            </xsl:variable>
            <div style="display:flex; color: grey; font-size: smaller; margin-bottom:0.5rem;">
                <span class="superscript">
                    <xsl:value-of select="$counter" />
                </span>
                <div style="display: inline; margin-left: .25rem;">
                    <xsl:copy-of select="$content" />
                </div>
            </div>
        </xsl:for-each>
    </xsl:variable>


    <xsl:function name="functx:index-of-deep-equal-node" as="xs:integer*">
        <xsl:param name="nodes" as="node()*" />
        <xsl:param name="nodeToFind" as="node()" />
        <xsl:sequence select="
                for $seq in (1 to count($nodes))
                return
                    $seq[deep-equal($nodes[$seq], $nodeToFind)]" />
    </xsl:function>


    <!-- DEFAULT TEMPLATEs ======================================================= -->
    
    
    <xd:doc scope="component">
        <xd:desc>Disable output for XML comments</xd:desc>
    </xd:doc>
    <xsl:template match="comment()" mode="#all" />
    
    <xd:doc scope="component">
        <xd:desc>Disable output for XML processing-instructions</xd:desc>
    </xd:doc>
    <xsl:template match="processing-instruction()" mode="#all" />

    <xsl:template match="/">
        <xsl:apply-templates />
        <xsl:if test="$footnotes != ''">
            <hr />
            <xsl:copy-of select="$footnotesBlock" />
        </xsl:if>
    </xsl:template>


    <xsl:template match="mei:p" name="mei:p">
        <p>
            <xsl:if test="@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix, @xml:id)" />
            </xsl:if>
            <xsl:apply-templates select="* | text()" />
        </p>
    </xsl:template>


    <xsl:template match="mei:annot[@type = 'note' and @place = 'foot']">
        <xsl:variable name="footnoteCount">
            <xsl:value-of select="functx:index-of-deep-equal-node($footnotes/mei:annot, .)" />
        </xsl:variable>
        <span class="superscript">
            <xsl:value-of select="$footnoteCount" />
        </span>
    </xsl:template>

    <xd:doc scope="component">
        <xd:desc>Transform mei:ref elements to HTML a-elements. Adds a onclick attribute to handle links with the Edirom Online LinkController.</xd:desc>
    </xd:doc>
    <xsl:template match="mei:ref">
        <xsl:element name="a">
            <xsl:attribute name="class">ref</xsl:attribute>
            <xsl:attribute name="href" select="@target" />
            <xsl:choose>
                <xsl:when test="matches(@target, '\[.*\]')">
                    <!-- target contains square brackets
                        this ca n be used to submit loadlink options
                    -->
                    <xsl:attribute name="onclick">
                        <xsl:text>loadLink('</xsl:text>
                        <xsl:value-of select="replace(@target, '\[.*\]', '')" />
                        <xsl:text>', {</xsl:text>
                        <xsl:value-of select="replace(substring-before(substring-after(@target, '['), ']'), '=', ':')" />
                        <xsl:text>}); return false;</xsl:text>
                    </xsl:attribute>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:attribute name="onclick">
                        <xsl:text>loadLink('</xsl:text>
                        <xsl:value-of select="@target" />
                        <xsl:text>'); return false;</xsl:text>
                    </xsl:attribute>
                </xsl:otherwise>
            </xsl:choose>
            <xsl:if test="@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix, @xml:id)" />
            </xsl:if>
            <xsl:apply-templates select="* | text()" />
        </xsl:element>
    </xsl:template>


    <xsl:template match="mei:rend">
        <xsl:variable name="style">
            <xsl:if test="@color"> color: <xsl:choose> <xsl:when test="starts-with(@color, 'x')"> #<xsl:value-of select="substring(@color, 2)" /> </xsl:when> <xsl:otherwise> <xsl:value-of select="@color" /> </xsl:otherwise> </xsl:choose>; </xsl:if>
            <xsl:if test="@fontfam | @fontname"> font-family: <xsl:value-of select="string-join(@fontfam | @fontname, ', ')" />; </xsl:if>
            <xsl:if test="@fontweight"> font-weight: <xsl:value-of select="@fontweight" />; </xsl:if>
            <xsl:if test="not(@fontweight) and @rend = 'bold'"> font-weight: <xsl:value-of select="'bold'" />; </xsl:if>
            <xsl:if test="@fontstyle"> font-style: <xsl:value-of select="
                    if (@fontstyle eq 'ital') then
                        ('italic')
                    else
                        (@fontstyle)" />; </xsl:if>
        </xsl:variable>
        <span>
            <xsl:if test="@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix, @xml:id)" />
            </xsl:if>
            <xsl:if test="@rend and string-length(@rend) gt 0">
                <xsl:attribute name="class" select="@rend" />
            </xsl:if>
            <xsl:if test="string-length($style) gt 0">
                <xsl:attribute name="style" select="normalize-space($style)" />
            </xsl:if>
            <xsl:apply-templates select="* | text()" />
        </span>
    </xsl:template>

    <xd:doc scope="component">
        <xd:desc>Transform mei:lb to HTML br-element or HTML span-Element with ' | ' as content, depending on its ancestor.</xd:desc>
    </xd:doc>
    <xsl:template match="mei:lb">

        <xsl:variable name="element-name" select="
                if (ancestor::mei:titlePage) then
                    'br'
                else
                    'span'" />

        <xsl:element name="{$element-name}">

            <xsl:if test="@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix, @xml:id)" />
            </xsl:if>

            <xsl:if test="$element-name = 'span'">
                <xsl:text> | </xsl:text>
            </xsl:if>

        </xsl:element>

    </xsl:template>


    <xsl:template match="mei:quote">
        <span class="quote">
            <xsl:if test="@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix, @xml:id)" />
            </xsl:if>
            <xsl:apply-templates select="* | text()" />
        </span>
    </xsl:template>
    <xsl:template match="mei:fig[./mei:graphic]">
        <!-- TODO: abfangen, wenn sowohl fig als auch graphic eine ID haben… -->
        <img class="fig">
            <xsl:if test="@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix, @xml:id)" />
            </xsl:if>
            <xsl:if test="not(@xml:id) and ./mei:graphic/@xml:id">
                <xsl:attribute name="xml:id" select="concat($idPrefix, ./mei:graphic/@xml:id)" />
            </xsl:if>
            <xsl:if test="./mei:caption">
                <xsl:attribute name="title" select="./mei:caption//text()" />
                <xsl:attribute name="alt" select="./mei:caption//text()" />
            </xsl:if>
            <xsl:attribute name="src" select="./mei:graphic/data(@target)" />
            <xsl:if test="./mei:graphic/@rend">
                <xsl:attribute name="style" select="./mei:graphic/data(@rend)" />
            </xsl:if>
        </img>
    </xsl:template>
    <xsl:template match="text()">
        <xsl:copy />
    </xsl:template>
</xsl:stylesheet>
