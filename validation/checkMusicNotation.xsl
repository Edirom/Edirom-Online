<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:mei="http://www.music-encoding.org/ns/mei"
    exclude-result-prefixes="xs xd mei"
    version="3.0">
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Aug 24, 2016</xd:p>
            <xd:p><xd:b>Author:</xd:b> Daniel Röwenstrunk</xd:p>
            <xd:p></xd:p>
        </xd:desc>
    </xd:doc>
    
    <xsl:output encoding="UTF-8" method="text" xpath-default-namespace="http://www.music-encoding.org/ns/mei"/>
    
    <xsl:template match="/">
        
        <xsl:variable name="isMusicNotation" as="xs:boolean*">
            <xsl:call-template name="checkNamespace">
                <xsl:with-param name="element" select="/*"/>
            </xsl:call-template>
            <xsl:call-template name="checkElementName">
                <xsl:with-param name="element" select="/*"/>
                <xsl:with-param name="name" select="'mei'"/>
            </xsl:call-template>
            <xsl:call-template name="checkElementExistance">
                <xsl:with-param name="element" select="//mei:work[1]"/>
                <xsl:with-param name="name" select="'work'"/>
                <xsl:with-param name="exists" select="false()"/>
            </xsl:call-template>
            <xsl:call-template name="checkElementExistance">
                <xsl:with-param name="element" select="//mei:source[1]"/>
                <xsl:with-param name="name" select="'source'"/>
            </xsl:call-template>
        </xsl:variable>
        <xsl:if test="count($isMusicNotation) = 0">
            <xsl:call-template name="reportSuccess">
                <xsl:with-param name="message">The root element of the XML file (<xsl:value-of select="name(/*)"/>) is in the MEI namespace, there is no work element and there is a source element, so Edirom Online would consider this file as a music notation object.</xsl:with-param>
            </xsl:call-template>
            
            <xsl:call-template name="checkElementValue">
                <xsl:with-param name="element" select="(//mei:source/mei:titleStmt/mei:title)[1]"/>
                <xsl:with-param name="success" select="'Reading the value of //mei:source/mei:titleStmt/mei:title[1], the title of the music notation object is &quot;{%0}&quot;.'"/>
                <xsl:with-param name="empty" select="'The title element (//mei:source/mei:titleStmt/mei:title[1]) is there, but empty.'"/>
                <xsl:with-param name="error" select="'There is no title for the music notation object. It should be defined in //mei:source/mei:titleStmt/mei:title'"/>
            </xsl:call-template>
            
        </xsl:if>
    </xsl:template>
    
    <xsl:template name="checkNamespace" as="xs:boolean?">
        <xsl:param name="element" as="element()"/>
        <xsl:choose>
            <xsl:when test="not(namespace-uri($element) eq 'http://www.music-encoding.org/ns/mei')">
                <xsl:call-template name="reportError">
                    <xsl:with-param name="message">The element (<xsl:value-of select="name($element)"/>) is not in the MEI namespace. It's namespace URI is <xsl:value-of select="namespace-uri($element)"/> but should be http://www.music-encoding.org/ns/mei.</xsl:with-param>
                </xsl:call-template>
                <xsl:value-of select="false()"/>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="checkElementName" as="xs:boolean?">
        <xsl:param name="element" as="element()"/>
        <xsl:param name="name" as="xs:string"/>
        <xsl:choose>
            <xsl:when test="not(local-name($element) eq $name)">
                <xsl:call-template name="reportError">
                    <xsl:with-param name="message">The element (<xsl:value-of select="name($element)"/>) is expected to be a <xsl:value-of select="$name"/> element.</xsl:with-param>
                </xsl:call-template>
                <xsl:value-of select="false()"/>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="checkElementExistance" as="xs:boolean?">
        <xsl:param name="element" as="element()?"/>
        <xsl:param name="name" as="xs:string"/>
        <xsl:param name="exists" select="true()" as="xs:boolean"/>
        <xsl:choose>
            <xsl:when test="$exists and not(exists($element))">
                <xsl:call-template name="reportError">
                    <xsl:with-param name="message">The element (<xsl:value-of select="$name"/>) should exist, but can't be found.</xsl:with-param>
                </xsl:call-template>
                <xsl:value-of select="false()"/>
            </xsl:when>
            <xsl:when test="not($exists) and exists($element)">
                <xsl:call-template name="reportError">
                    <xsl:with-param name="message">The element (<xsl:value-of select="$name"/>) must not exist, but was found at <xsl:value-of select="path($element)"/>.</xsl:with-param>
                </xsl:call-template>
                <xsl:value-of select="false()"/>
            </xsl:when>
        </xsl:choose>
    </xsl:template>
    
    <xsl:template name="checkElementValue">
        <xsl:param name="element" as="element()"/>
        <xsl:param name="success" as="xs:string"/>
        <xsl:param name="empty" as="xs:string"/>
        <xsl:param name="error" as="xs:string"/>
        <xsl:choose>
            <xsl:when test="exists($element) and string-length(data($element)) > 0">
                <xsl:call-template name="reportSuccess">
                    <xsl:with-param name="message" select="replace($success, '\{%0\}', data($element))"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:when test="exists($element) and string-length(data($element)) = 0">
                <xsl:call-template name="reportSuccess">
                    <xsl:with-param name="message" select="$empty"/>
                </xsl:call-template>
            </xsl:when>
            <xsl:otherwise>
                <xsl:call-template name="reportError">
                    <xsl:with-param name="message" select="$error"/>
                </xsl:call-template>
            </xsl:otherwise>
        </xsl:choose>        
    </xsl:template>
    
    <xsl:template name="reportError">
        <xsl:param name="message"/>
        <xsl:message>Error: <xsl:value-of select="$message"/></xsl:message>
    </xsl:template>
    
    <xsl:template name="reportSuccess">
        <xsl:param name="message"/>
        <xsl:message>Success: <xsl:value-of select="$message"/></xsl:message>
    </xsl:template>
</xsl:stylesheet>